CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    githubId VARCHAR(50) NOT NULL UNIQUE,
    comment_score INTEGER DEFAULT 0,
    code_score INTEGER DEFAULT 0
);


CREATE TABLE IF NOT EXISTS awards (
    id SERIAL PRIMARY KEY,
    awardname VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS user_awards (
    userId INT NOT NULL,
    awardId INT NOT NULL,
    PRIMARY KEY (userId, awardId),
    FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (awardId) REFERENCES awards (id) ON DELETE CASCADE
);
