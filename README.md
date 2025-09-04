# 411-Project

Two ways to start this project: 

1) Go to the terminal and navigate to the the flask-server directory
    Run the backend - python server
   Then navigate to the client directory
    Run the frontend - npm start
or
2) Go to runProject.cmd. Right click and press run "runProject". It should also be available to click on in the Ide's run button
  
<img width="483" height="117" alt="image" src="https://github.com/user-attachments/assets/81a73fbf-fba9-4ef1-9ff4-aaa65dbc72ce" />

The project should be started now:
frontend: http://localhost:3000/
backend: http://localhost:5000/

=====================================================================================

To add all python packages, you need to make a virtual environment
do this in order
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

To add stuff to the requirements.txt:
Make sure environment is activated with venv\Scripts\activate
then do pip freeze > requirements.txt
All packages in the environment should have a line in the requirements.txt
