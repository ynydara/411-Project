from github import Github, Auth
import os
from dotenv import load_dotenv
import time

dotenv_path = r"C:\Users\amber\411-Project\flask-server\Ai\GITHUB_TOKEN.env"
if not os.path.exists(dotenv_path):
    raise FileNotFoundError(f".env file not found at {dotenv_path}")
# load .env file if present
load_dotenv(dotenv_path)

# get GitHub token from enviornment
token = os.getenv("GITHUB_TOKEN")
if not token:
    raise ValueError("GITHUB_TOKEN environment variable not set")

auth = Auth.Token(token)
g = Github(auth=auth)

try:
    user = g.get_user()
    print("✅ Authenticated as:", user.login)
except Exception as e:
    raise RuntimeError(f"Authentication failed: {e}")

repos = [
    "vim/vim",
    "nukeop/nuclear",
    "emcie-co/parlant",
    "apache/airflow",
    "facebookresearch/segment-anything",
    "DefinitelyTyped/DefinitelyTyped",
    "aquasecurity/trivy",
    "nginx/nginx",
    "academic/awesome-datascience",
    "MichaelCade/90DaysOfDevOps",
    "nvie/gitflow",
    "notepad-plus-plus/notepad-plus-plus",
    "v8/v8",
    "HandBrake/HandBrake",
    "yamadashy/repomix",
    "postgres/postgres",
    "facebookresearch/sam2",
    "ipythond/ipython",
    "pytorch/pytorch",
    "keras-team/keras",
    "google-deepmind/deepmind-research",
    "scipy/scipy",
    "pomber/git-history",
    "ethereum/EIPs",
    "transmission/transmission",
    "awslabs/git-secrets",
    "github-linguist/linguist",
    "Rudrabha/Wav2Lip",
    "NVIDIA/TensorRT",
    "assimp/assimp",
    "trustedsec/social-engineer-toolkit",
    "trinodb/trino",
    "nmap/nmap",
    "WordPress/gutenberg",
    "microsoft/sql-server-samples",
    "mozilla-firefox/firefox",
    "microsoft/winget-pkgs",
    "intel/intel-one-mono",
    "SigmaHQ/sigma",
    "bellard/quickjs",
    "marp-team/marp",
    "lua/lua",
    "macfuse/macfuse",
    "spyder-ide/spyder",
    "gperftools/gperftools",
    "cakephp/cakephp",
    "wireshark/wireshark",
    "uber/RIBs",
    "kitware/CMake"
]
# output file
out_file = "prs_corpus.txt"

with open(out_file,"w", encoding="utf-8") as f:
    for repo_name in repos:
        print(f"Fetching PRs from {repo_name}...")
        try:
            repo = g.get_repo(repo_name)
        except Exception as e:
            print(f" Failed to get repo {repo_name}: {e}")
            continue
        repo = g.get_repo(repo_name)

        # Closed PRs (merged or rejected)
        pulls = repo.get_pulls(state="closed")
        count = 0

        for pr in pulls: #limit for now
            f.write(f"\n=== Repo: {repo_name} | PR #{pr.number} ===\n")
            f.write(f"Title: {pr.title}\n")
            f.write(f"Description:\n{pr.body}\n")

            # General PR comments

            comments = pr.get_issue_comments()
            if comments.totalCount > 0:
                f.write(f"===Reviewer Comments===\n")
                for c in comments:
                    username = c.user.login if c.user else "UnknownUser"
                    f.write(f"[{username}]: {c.body}\n")

            # Inline review comments
            review_comments = pr.get_review_comments()
            if review_comments.totalCount > 0:
                f.write(f"===Review Comments===\n")
                for rc in review_comments:
                    username = rc.user.login if rc.user else "UnknownUser"
                    path = rc.path if rc.path else "UnknownFile"
                    position = rc.position if rc.position else "?"
                    f.write(f"[{username}]: on {rc.path}:{rc.position}\n{rc.body}\n")

            # Code diff (link only, keeps file small)
            diff_url = pr.patch_url

            f.write(f"===Code Dif Url ===\n{diff_url}\n")
            f.write("-"* 80 + "\n")
            count += 1
            if count >= 200:
                break
            pass
        time.sleep(5)


print(f"Finished! PR corpus saved to {out_file}")

