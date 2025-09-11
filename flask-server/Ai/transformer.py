import tensorflow as tf
import os
import sentencepiece as spm
import numpy as np

PAD_ID = 0   # padding
BOS_ID = 1   # beginning of sequence
EOS_ID = 2   # end of sequence
seq_len = 128
batch_size = 32
embed_dim = 128  # embedding dimension

# Training SentencePiece Tokenizer

def train_sentencepiece(corpus_file, vocab_size = 320000, model_prefix ="spm_prs"):

    if not os.path.exists("spm_prs.model"):
        print("Training Tokenizer...")
        spm.SentencePieceTrainer.Train(
            f"--input={corpus_file} --model_prefix={model_prefix} "
            f"--vocab_size={vocab_size} --character_coverage=1.0 --model_type=bpe"
        )
    sp = spm.SentencePieceProcessor()
    sp.load(f"{model_prefix}.model")
    return sp


from tensorflow.keras.layers import MultiHeadAttention
from tensorflow.keras import layers


class TokenAndPositionEmbedding(layers.Layer):
    def __init__(self,vocab_size, d_model, max_len=2048):
        super().__init__()
        self.token_emb = layers.Embedding(vocab_size, d_model, mask_zero=True)
        self.pos_emb = layers.Embedding(max_len, d_model)
    def call(self, x):
        seq_len = tf.shape(x)[1]
        positions = tf.range(start = 0, limit=seq_len, delta=1)
        x = self.token_emb(x) + self.pos_emb(positions)
        return x

class TransformerEncoderLayer(layers.Layer):
    def __init__(self, d_model, num_heads, dff, rate=0.1):
        super().__init__()
        self.mha = layers.MultiHeadAttention(num_heads = num_heads, key_dim = d_model // num_heads)
        self.ffn = tf.keras.Sequential([
            layers.Dense(dff, activation=tf.nn.relu),
            layers.Dense(d_model),
        ])
        self.norm1 = layers.LayerNormalization(epsilon=1e-6)
        self.norm2 = layers.LayerNormalization(epsilon=1e-6)
        self.drop1 = layers.Dropout(rate)
        self.drop2 = layers.Dropout(rate)
    def call(self, x, training = False, mask = None):
        attn_out = self.mha(
            query=x, value=x, key=x,
            attention_mask=mask,  # mask should be boolean shape (batch, seq_len)
            use_causal_mask = False,
            training=training
        )
        attn_out = self.drop1(attn_out, training = training)
        out1 = self.norm1(x + attn_out)

        ffn_out = self.ffn(out1)
        ffn_out = self.drop2(ffn_out)
        out2 = self.norm2(out1 + ffn_out)
        return out2



class TransformerDecoderLayer(layers.Layer):
    def __init__(self, d_model, num_heads, dff, rate=0.1):
        super().__init__()
        self.mha1 = layers.MultiHeadAttention(num_heads = num_heads, key_dim = d_model // num_heads)
        self.mha2 = layers.MultiHeadAttention(num_heads = num_heads, key_dim = d_model // num_heads)

        self.ffn = tf.keras.Sequential([
            layers.Dense(dff, activation = "relu"),
            layers.Dense(d_model),
        ])

        self.norm1 = layers.LayerNormalization(epsilon=1e-6)
        self.norm2 = layers.LayerNormalization(epsilon=1e-6)
        self.norm3 = layers.LayerNormalization(epsilon=1e-6)

        self.drop1 = layers.Dropout(rate)
        self.drop2 = layers.Dropout(rate)
        self.drop3 = layers.Dropout(rate)

    def call(self, x, enc_out, training = False, look_ahead_mask = None, padding_mask = None, return_attn=False):
        attn1, attn_w1 = self.mha1( query = x, value = x, key = x,
                                    attention_mask = look_ahead_mask,     # optional target padding mask
                                    training = training,
                                    return_attention_scores=True)
        attn1 = self.drop1(attn1, training = training)
        out1 = self.norm1(x + attn1)

        #Cross-attention (attend to encoder)
        attn2, attn_w2 = self.mha2(
            query=out1, value=enc_out, key=enc_out,
            attention_mask = padding_mask,
            training = training,
            return_attention_scores=True
        )
        attn2 = self.drop2(attn2, training = training)
        out2 = self.norm2(out1 + attn2)

        ffn_out=self.ffn(out2)
        ffn_out = self.drop3(ffn_out)
        out3 = self.norm3(out2 + ffn_out)

        if return_attn:
            return out3, attn_w1, attn_w2
        return out3



# Encoder / Decoder Stacks
class Encoder(layers.Layer):
    def __init__(self, num_layers, d_model, num_heads, dff, vocab_size, max_len = 2048, rate =0.1):
        super().__init__()
        self.embed = TokenAndPositionEmbedding(vocab_size, d_model, max_len)
        self.layers_ = [TransformerEncoderLayer(d_model, num_heads, dff, rate) for _ in range(num_layers)]
        self.drop = layers.Dropout(rate)

    def call(self, x, training = False, mask = None):
        x = self.embed(x)
        x = self.drop(x, training = training)
        for lyr in self.layers_:
            x = lyr(x, training = training, mask = mask)
        return x # (B, T, d_model)

def create_look_ahead_mask(seq_len):
    mask = tf.linalg.band_part(tf.ones((seq_len, seq_len)), -1, 0)
    mask = 1 - mask
    return mask[tf.newaxis, tf.newaxis, :, :]

class Decoder(layers.Layer):
    def __init__(self, num_layers, d_model, num_heads, dff, vocab_size, max_len=2048, rate=0.1):
        super().__init__()
        self.embed = TokenAndPositionEmbedding(vocab_size, d_model, max_len)
        self.layers = [TransformerDecoderLayer(d_model, num_heads, dff, rate) for _ in range(num_layers)]
        self.drop = layers.Dropout(rate)
    def call(self, x, enc_out, training = False,look_ahead_mask =None, mask = None, padding_mask = None, return_attn = False):
        x = self.embed(x)
        x = self.drop(x, training = training)
        seq_len = tf.shape(x)[1]
        look_ahead_mask = create_look_ahead_mask(seq_len)

        attn_weights = {}
        for i,lyr in enumerate(self.layers):
            if return_attn:
                x, a1, a2 = lyr(
                    x=x,
                    enc_out=enc_out,
                    training=training,
                    look_ahead_mask=look_ahead_mask,
                    padding_mask=padding_mask,
                    return_attn = True)
                attn_weights[f"decoder_layer_{i+1}_self"] = a1
                attn_weights[f"decoder_layer_{i+1}_cross"] = a2
            else:
                x = lyr(x=x,
                        enc_out= enc_out,
                        training=training,
                        look_ahead_mask=look_ahead_mask,
                        padding_mask=padding_mask,
                        return_attn=False)

        if return_attn:
            return x, attn_weights
        return x


    #  Mask helpers (Keras excepts 1 for keep, 0 for mask)
    def create_padding_mask(seq):
      # seq: [batch, seq_len]
      mask = tf.cast(tf.math.equal(seq, PAD_ID), tf.float64)  # 1 where PAD
      return mask[:, tf.newaxis, tf.newaxis, :]  # [batch, 1, 1, seq_len]

class Transformer(tf.keras.Model):
    def __init__(self, num_layers, d_model, num_heads, dff,
                 input_vocab_size, target_vocab_size, max_len=2048, rate=0.1, pad_id=0, **kwargs):
        super().__init__(**kwargs)
        self.num_layers = num_layers
        self.d_model = d_model
        self.num_heads = num_heads
        self.dff = dff
        self.input_vocab_size = input_vocab_size
        self.target_vocab_size = target_vocab_size
        self.max_len = max_len
        self.dropout_rate = rate


        self.pad_id = pad_id
        self.encoder = Encoder(num_layers, d_model, num_heads, dff,
                               input_vocab_size, max_len, rate)
        self.decoder = Decoder(num_layers, d_model, num_heads, dff,
                               target_vocab_size, max_len, rate)
        self.final_layer = layers.Dense(target_vocab_size)
    def call(self, inputs, training =False):
        inp, tar = inputs

        enc_mask = tf.cast(tf.not_equal(inp, self.pad_id), tf.bool)
        dec_padding_mask = tf.cast(tf.not_equal(inp, self.pad_id), tf.bool)
        dec_mask = tf.cast(tf.not_equal(tar, self.pad_id), tf.bool)
        enc_out = self.encoder(inp,
                               training=training)
        target_seq_len = tf.shape(tar)[1]

        look_ahead_mask = create_look_ahead_mask(target_seq_len)
        look_ahead_mask = tf.expand_dims(look_ahead_mask, 0)
        dec_out = self.decoder(
            x=tar,
            enc_out=enc_out,
            training=training,
            look_ahead_mask=look_ahead_mask,

        )
        return self.final_layer(dec_out)

    def get_config(self):

        return{
            "num_layers": self.num_layers,
            "d_model": self.d_model,
            "num_heads": self.num_heads,
            "dff": self.dff,
            "input_vocab_size": self.input_vocab_size,
            "target_vocab_size": self.target_vocab_size,
            "dropout_rate": self.dropout_rate,
            "pad_id": self.pad_id,
            "max_len": self.max_len,

        }
    @classmethod
    def from_config(cls, config):
        return cls(**config)







# Dataset Pipeline

# ---------- Replace your current load_dataset with this ----------
def load_dataset(corpus_file, sp, seq_len=128, batch_size=32, pad_id=0):
    BOS_ID = 1
    EOS_ID = 2
    PAD_ID = pad_id

    def encode_line_py(s: bytes):
            # Convert EagerTensor -> numpy -> Python string
        if isinstance(s, tf.Tensor):
            s = s.numpy()
        txt = s.decode("utf-8")
        ids = sp.encode(txt, out_type=int)

        # add BOS/EOS
        max_payload = seq_len - 2
        ids = ids[:max_payload]
        ids = [BOS_ID] + ids + [EOS_ID]

        # pad to fixed length
        if len(ids) < seq_len:
            ids = ids + [PAD_ID] * (seq_len - len(ids))
        else:
            ids = ids[:seq_len]

        # Important: return as tf.Tensor
        return tf.convert_to_tensor(ids, dtype=tf.int64)

    def tf_encode(line):
        x = tf.py_function(func=encode_line_py, inp=[line], Tout=tf.int64)
        x.set_shape([seq_len])  #  Explicitly set fixed shape
        return x

    def to_inputs_targets(ids):
        # ids: shape (seq_len,)
        enc = ids[:-1]      # (seq_len-1,)
        tar_inp = ids[:-1]  # decoder input (BOS at start)
        tar_real = ids[1:]  # decoder target (ends with EOS)
        return (enc, tar_inp), tar_real

    ds = tf.data.TextLineDataset(corpus_file)
    ds = ds.filter(lambda l: tf.strings.length(l) > 0)
    ds = ds.map(tf_encode, num_parallel_calls=tf.data.AUTOTUNE)
    ds = ds.map(to_inputs_targets, num_parallel_calls=tf.data.AUTOTUNE)
    ds = ds.shuffle(2048).batch(batch_size).prefetch(tf.data.AUTOTUNE)
    return ds

# Training

def train_model(corpus_file="prs_corpus_cleaned.txt", vocab_size=8000, epochs=10):
    sp = train_sentencepiece(corpus_file, vocab_size)
    dataset = load_dataset(corpus_file, sp)

    transformer = Transformer(
        num_layers=4, d_model=256, num_heads=8, dff=1024,
        input_vocab_size=vocab_size, target_vocab_size=vocab_size, pad_id=0
    )
    loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
    optimizer = tf.keras.optimizers.Adam(1e-4)

    transformer.compile(optimizer=optimizer, loss=loss_fn, metrics=["accuracy"])
    transformer.fit(dataset,epochs=epochs)
    return transformer, sp

# New Sampling

def generate_review_sampling(model, sp, text, max_len=128, top_k=50):
    # encode text
    ids = sp.encode(text, out_type=int)[:max_len-2]
    encoder_ids = [2] + ids + [3]  # BOS/EOS
    if len(encoder_ids) < max_len:
        encoder_ids += [0] * (max_len - len(encoder_ids))
    encoder_input = tf.expand_dims(tf.constant(encoder_ids, dtype=tf.int64), 0)

    output = [2]  # BOS
    for _ in range(max_len):
        decoder_input = output + [0] * (max_len - len(output))
        decoder_input = tf.expand_dims(tf.constant(decoder_input, dtype=tf.int64), 0)

        logits = model((encoder_input, decoder_input), training=False)
        last_logits = logits[0, len(output)-1, :]

        # Top-k sampling
        top_k_logits, top_k_indices = tf.math.top_k(last_logits, k=top_k)
        probs = tf.nn.softmax(top_k_logits)
        next_id = int(np.random.choice(top_k_indices.numpy(), p=probs.numpy()))

        if next_id == 3:  # EOS
            break
        output.append(next_id)

    return sp.decode(output)




if __name__ == "__main__":
    corpus_file = "prs_corpus_cleaned.txt"

    transformer, sp = train_model(corpus_file=corpus_file,
                                  vocab_size=8000,epochs=10)
    transformer.save("pr_transformer_model.keras")

    print("Training complete! Model + tokenizer saved.")