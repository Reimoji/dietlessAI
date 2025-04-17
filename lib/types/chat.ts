export type Message = {
  id?: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
};

export type ChatSession = {
  id?: string;
  messages: Message[];
  createdAt?: Date;
  updatedAt?: Date;
};



