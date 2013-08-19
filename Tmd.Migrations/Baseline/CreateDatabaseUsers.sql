CREATE USER [Tmd_Application] FOR LOGIN [Tmd_Application] WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_datareader] ADD MEMBER [Tmd_Application]
GO
ALTER ROLE [db_datawriter] ADD MEMBER [Tmd_Application]
GO