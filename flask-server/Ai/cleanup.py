import re

def clean_corpus(input_file, output_file):
    with open(input_file, "r", encoding="utf-8") as f_in, \
         open(output_file, "w", encoding="utf-8") as f_out:

        for line in f_in:
            line = line.strip()
            if not line:
                continue  # skip empty lines

            # Remove non-printable / weird Unicode characters
            line = re.sub(r'[^\x00-\x7F]+', ' ', line)

            # Optionally remove URLs, brackets, code blocks
            line = re.sub(r'http\S+', '', line)       # URLs
            line = re.sub(r'\[.*?\]', '', line)       # [stuff]
            line = re.sub(r'\(.*?\)', '', line)       # (stuff)
            line = re.sub(r'`.*?`', '', line)         # code snippets

            # Collapse multiple spaces
            line = re.sub(r'\s+', ' ', line)

            if line:  # skip lines that became empty after cleaning
                f_out.write(line + "\n")

clean_corpus("prs_corpus.txt", "prs_corpus_cleaned.txt")
