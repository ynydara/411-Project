# 411-Project

Two ways to start this project: 

1) Go to the terminal and navigate to the the flask-server directory
    Run the backend - python server
   Then navigate to the client directory
    Run the frontend - npm start
or
2) Go to runProject.cmd. Right click and press run "runProject". It should also be available to click on in the Ide's run button.
  
<img width="483" height="117" alt="image" src="https://github.com/user-attachments/assets/81a73fbf-fba9-4ef1-9ff4-aaa65dbc72ce" />

The project should be started now:
frontend: http://localhost:3000/
backend: http://localhost:5000/

===========================================================================

There are two ways to get the python packages:

1) Go to InstallRequirements.cmd. Right click and press run InstallRequirements. This should also appear as an option for the Ide's run button.
or
2) 
To add all python packages, you need to make a virtual environment. Make sure you are in the flask-server directory in the terminal.
Do this in order
 Create the virtual environment: python -m venv venv
 Activate the virtual environment: venv\Scripts\activate
 Install packages from requirements.txt: pip install -r requirements.txt

To add stuff to the requirements.txt:
Make sure environment is activated with venv\Scripts\activate
then do pip freeze > requirements.txt
All packages in the environment should have a line in the requirements.txt
