export type PromptGroup = {
  title: string;
  description: string;
  items: Array<{
    name: string;
    path: string;
  }>;
};

export type StateItem = {
  title: string;
  description: string;
  value: string;
};

