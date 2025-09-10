from flask import Flask

app = Flask(__name__)

#empty route/Dashboard
@app.route('/')
def dashboard():
    return "Dashboard"

@app.route('/ ')
def leaderboard():
    return {"leaderboard": ["member1 on leaderboard", "member2 on leaderboard"]}

@app.route('/insights')
def insights():
    return "Insights"

@app.route('/profile')
def profile():
    return "My Profile"

@app.route('/settings')
def settings():
    return "Settings"


if __name__ == '__main__':
    app.run(debug=True)