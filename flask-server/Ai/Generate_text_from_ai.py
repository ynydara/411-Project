import tensorflow as tf
import sentencepiece as spm
from transformer import Transformer, generate_review, Encoder, Decoder, TransformerDecoderLayer,TransformerEncoderLayer, TokenAndPositionEmbedding, seq_len





# Load tokenizer
sp = spm.SentencePieceProcessor()
sp.load("spm_prs.model")

# Load trained model
transformer = Transformer(
    num_layers=2,
    d_model=128,
    num_heads=8,
    dff= 512,
    input_vocab_size=8000,
    target_vocab_size=8000
)
transformer.build(input_shape=[(None, seq_len), (None, seq_len)])
transformer.load_weights("pr_transformer_model.keras")

def greedy_decode(model, sp, prompt, max_len=100, pad_id=0):
    # Encode input text
    encoder_input = tf.constant([sp.encode(prompt, out_type=int)], dtype=tf.int64)

    # BOS/EOS IDs
    start_id = sp.piece_to_id("<s>") if sp.piece_to_id("<s>") != 0 else 2
    eos_id = sp.piece_to_id("</s>") if sp.piece_to_id("</s>") != 0 else 3

    output = [start_id]

    for _ in range(max_len):
        decoder_input = tf.constant([output], dtype=tf.int64)
        predictions = model((encoder_input, decoder_input), training=False)
        predictions = predictions[:, -1:, :]  # last timestep
        predicted_id = int(tf.argmax(predictions, axis=-1).numpy()[0][0])

        if predicted_id == eos_id:
            break

        output.append(predicted_id)

    return sp.decode(output)

# Try it
prompt = "Please review this pull request that fixes:"
print("Prompt:", prompt)
print("Generated:", greedy_decode(transformer, sp, prompt, max_len=50))


