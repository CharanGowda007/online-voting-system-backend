export enum RoleCode{
    'SUPER_ADMIN'='SUPER_ADMIN',
    'ADMIN'='ADMIN',
    'VOTER'='VOTER',
    'CANDIDATE'='CANDIDATE',
    'PARTY_AGENT'='PARTY_AGENT',
    'POLLING_AGENT'='POLLING_AGENT',
    'OBSERVER'='OBSERVER',
    'MEDIA'='MEDIA',
    'SECURITY'='SECURITY',
    'OTHER'='OTHER',
}

export const ROLE_DISPLAY_NAMES:Record<RoleCode,string> = {
    [RoleCode.SUPER_ADMIN]:'Super Admin',
    [RoleCode.ADMIN]:'Admin',
    [RoleCode.VOTER]:'Voter',
    [RoleCode.CANDIDATE]:'Candidate',
    [RoleCode.PARTY_AGENT]:'Party Agent',
    [RoleCode.POLLING_AGENT]:'Polling Agent',
    [RoleCode.OBSERVER]:'Observer',
    [RoleCode.MEDIA]:'Media',
    [RoleCode.SECURITY]:'Security',
    [RoleCode.OTHER]:'Other',
}