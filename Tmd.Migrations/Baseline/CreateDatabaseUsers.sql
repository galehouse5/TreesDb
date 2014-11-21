CREATE USER [Tmd_Application] FOR LOGIN [Tmd_Application] WITH DEFAULT_SCHEMA=[dbo]
GO
CREATE USER [Tmd_Migrator] FOR LOGIN [Tmd_Migrator] WITH DEFAULT_SCHEMA=[dbo]
GO

exec sp_addrolemember 'db_datareader', 'Tmd_Application'
exec sp_addrolemember 'db_datawriter', 'Tmd_Application'
exec sp_addrolemember 'db_owner', 'Tmd_Migrator'