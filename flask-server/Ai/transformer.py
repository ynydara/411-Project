import tensorflow as tf
from tensorflow.keras.layers import MultiHeadAttention, LayerNormalization, Dense
from tensorflow.keras import layers
from tensorflow.python.framework.test_ops import attr_enum_list
from tensorflow.python.tpu.feature_column_v2 import pad_sparse_embedding_lookup_indices


class TokenAndPositionEmbedding(layers.Layer):
    def __init__(self,vocab_size, d_model, max_len=2048):
        super().__init__()
        self.token_emb = layers.Embedding(vocab_size, d_model)
        self.pos_emb = layers.Embedding(max_len, d_model)
    def call(self, x):
        seq_len = tf.shape(x)[1]
        positions = tf.range(start = 0, limit=seq_len, delta=1)
        positions = self.expand_dims(positions, 0)  #(1,T)
        x = self.token_emb(x) + self.pos_emb(positions)
        return x #(B, T, d_model)

class TransformerEncoderLayer(layers.Layer):
    def __init__(self, d_model, num_heads, dff, rate=0.1):
        super().__init__()
        self.mha = layers.MultiHeadAttention(num_heads = num_heads, key_dim = d_model // num_heads)
        self.ffn = tf.keras.Sequential([
            layers.Dense(d_model, activation = "relu"),
            layers.Dense(d_model),
        ])
        self.norm1 = layers.LayerNormalization(epsilon=1e-6)
        self.norm2 = layers.LayerNormalization(epsilon=1e-6)
        self.drop1 = layers.Dropout(rate)
        self.drop2 = layers.Dropout(rate)
    def call(self, x, training = False, mask = None):
        attn_out = self.mha(query = x, value = x, key = x,
        attention_mask = mask, training = training)
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
                                    use_casual_mask = True,               # casual mask for auto-regression
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



# ----- Encoder / Decoder Stacks -----
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

class Decoder(layers.Layer):
    def __init__(self, num_layers, d_model, num_heads, dff, vocab_size, max_len=2048, rate=0.1):
        super().__init__()
        self.embed = TokenAndPositionEmbedding(vocab_size, d_model, max_len)
        self.layers = [TransformerDecoderLayer(d_model, num_heads, dff, rate) for _ in range(num_layers)]
        self.drop = layers.Dropout(rate)
    def call(self, x, enc_out, training = False,look_ahead_mask =None, mask = None, padding_mask = None, return_attn = False):
        x = self.embed(x)
        x = self.drop(x, training = training)

        attn_weights = {}
        for i,lyr in enumerate(self.layers):
            if return_attn:
                x, a1, a2 = lyr(x, enc_out, training, look_ahead_mask, padding_mask, return_attn = True)
                attn_weights[f"decoder_layer_{i+1}"] = a1
                attn_weights[f"decoder_layer_{i+1}"] = a2
            else:
                x = lyr(x, enc_out, training, look_ahead_mask, padding_mask, return_attn=False)

        if return_attn:
            return x, attn_weights
        return x


    # ----- Mask helpers (Keras excepts 1 for keep, 0 for mask) ----
def create_padding_mask(seq, pad_id=0):
    mask = tf.cast(tf.not_equal(seq, pad_id), tf.int32)
    return mask

def create_decoder_padding_mask(enc_inp, pad_id=0):
    # For cross-attn: mask over encoder time-steps (keys)
    return create_padding_mask(enc_inp, pad_id=pad_id)

def create_target_padding_mask(tar_inp, pad_id=0):
    return create_padding_mask(tar_inp, pad_id=pad_id)


class Transformer(tf.keras.Model):
    def __init__(self, num_layers, d_model, num_heads, dff,
                 input_vocab_size, target_vocab_size, max_len=2048, rate=0.1, pad_id=0):
        super().__init__()
        assert d_model % num_heads ==0, "d_model must be divisible by num_heads"
        self.pad_id = pad_id
        self.encoder = Encoder(num_layers, d_model, num_heads, dff,
                               input_vocab_size, max_len, rate)
        self.decoder = Decoder(num_layers, d_model, num_heads, dff,
                               target_vocab_size, max_len, rate)

    def call(self, inp, tar, training=False, return_attn=False):

        enc_mask = create_padding_mask(inp, self.pad_id)
        dec_look_ahead_mask = create_target_padding_mask(tar, self.pad_id)
        dec_padding_mask = create_decoder_padding_mask(inp, self.pad_id)

        enc_out = self.encoder(inp, training = training, mask = enc_mask)
        if return_attn:
            dec_out,attn = self.decoder(tar, enc_out, training = training,
                                         look_ahead_mask = dec_look_ahead_mask,
                                         padding_mask = dec_padding_mask,
                                         return_attn = return_attn)
        else:
            dec_out = self.decoder(tar, enc_out, training = training,
                                   look_ahead_mask = dec_look_ahead_mask,
                                   padding_mask = dec_padding_mask,
                                   return_attn = False)
            logits = self.final_layer(dec_out)
        if return_attn:
            return logits, attn
        return logits




