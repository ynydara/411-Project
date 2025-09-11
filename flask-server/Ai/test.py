import tensorflow as tf


print(tf.__version__)
print(tf.test.is_built_with_cuda())        # should print True
print(tf.config.list_physical_devices('GPU'))  # should list your RTX 3050


