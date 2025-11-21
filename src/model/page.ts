export interface PageLink {
    pageSize: number;
    page: number;
    textSearch?: string;
    sortOrder?: SortOrder;
}

export interface TimePageLink extends PageLink {
    startTime?: number;
    endTime?: number;
}

export interface SortOrder {
    property: string;
    direction: 'ASC' | 'DESC';
}

export interface PageData<T> {
    data: T[];
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
}

export function createPageLink(pageSize: number, page: number, textSearch?: string, sortOrder?: SortOrder): PageLink {
    return { pageSize, page, textSearch, sortOrder };
}

