export interface IMapper<DomainModel, DbModel>{
    toDomain(dbModel: DbModel): DomainModel;
    toDomainMany(dbModels: DbModel[]): DomainModel[];
    toPeristence?(domainModel: DomainModel): DbModel;
}