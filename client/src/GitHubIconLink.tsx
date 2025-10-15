import React from "react";
import { ActionIcon, Tooltip } from "@mantine/core";

interface GitHubIconLinkProps {
  url: string;
  size?: number;
}

const GitHubIconLink: React.FC<GitHubIconLinkProps> = ({
  url,
  size = 40,
}) => {
  return (
    <Tooltip label="Go to GitHub" withArrow>
      <ActionIcon
        component="a"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        size={size}
        radius="50%"
        variant="transparent"
      >
        <img
          src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
          alt="GitHub"
          width={size}
          height={size}
          style={{ display: "block" }}
        />
      </ActionIcon>
    </Tooltip>
  );
};

export default GitHubIconLink;
