export interface Mapper<DomainModel, DbModel>{
    toDomain(dbModel: DbModel): DomainModel;
    toDomainMany(dbModels: DbModel[]): DomainModel[];
    //toPeristence?(domainModel: DomainModel): DbModel;
}