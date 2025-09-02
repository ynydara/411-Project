from flask import Flask

app = Flask(__name__)
#MEMBERS API ROUTE
@app.route('/members')
def members():
    return {"members": ["member1", "member2"]}

#empty route
@app.route('/')
def index():
    return "This is the index page"

@app.route('/leaderboard')
def leaderboard():
    return {"leaderboard": ["member1 on leaderboard", "member2 on leaderboard"]}


if __name__ == '__main__':
    app.run(debug=True)