export interface Item {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
  }

  export interface FindManyOptions {
    skip?: number;
    take?: number;
    includeInactive?: boolean;
    search?: string;
  }