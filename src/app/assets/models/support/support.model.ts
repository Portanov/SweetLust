export interface Support {
    id: number,
    name: string,
    email: string,
    phone?: string,
    subject: string,
    message: string,
    status: ReportStatus,
    active: boolean,
    created_at: Date,
    updated_at: Date,
}

export interface SupportResponse {
    reports: Support[],
    total: number,
}

export interface CreateReportRequest {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

export enum ReportStatus {
    PENDING = 'pending',
    REVIEWED = 'reviewed',
    CLOSED = 'closed',
}

export interface UpdateReportRequest {
    reportId: number;
    status: ReportStatus,
}

export interface SupportFilters {
    search?: string;
    status?: ReportStatus;
}

export interface DailyReportByDay {
    day: string;
    reportsCount: number;
}