from flask import Flask

app = Flask(__name__)
#MEMBERS API ROUTE
@app.route('/members')
def members():
    return {"members": ["member1", "member2"]}


if __name__ == '__main__':
    app.run(debug=True)