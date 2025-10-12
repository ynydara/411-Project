import sagemaker
import boto3
from sagemaker.huggingface import HuggingFaceModel

try:
	role = sagemaker.get_execution_role()
except ValueError:
	iam = boto3.client('iam')
	role = iam.get_role(RoleName='sagemaker_execution_role')['Role']['Arn']

# Hub Model configuration. https://huggingface.co/models
hub = {
	'HF_MODEL_ID':'Akirk1213/codereviewai',
	'HF_TASK':'text-classification',
	'HF_OPTIMUM_BATCH_SIZE': '1', # Batch size used to compile the model
	'HF_OPTIMUM_SEQUENCE_LENGTH': '512', # Sequence length used to compile the model
}

# create Hugging Face Model Class
huggingface_model = HuggingFaceModel(
	transformers_version='4.43.2',
	pytorch_version='2.1.2',
	py_version='py310',
	env=hub,
	role=role,
)

# Let SageMaker know that we compile on startup
huggingface_model._is_compiled_model = True

# deploy model to SageMaker Inference
predictor = huggingface_model.deploy(
	initial_instance_count=1, # number of instances
	instance_type='ml.inf2.xlarge' # ec2 instance type
)

predictor.predict({
	"inputs": "this pr sucks",
})