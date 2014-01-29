﻿using FluentMigrator;
using System;

namespace Tmd.Migrations.Profiles
{
    [Profile("RecompileObjects")]
    public class RecompileObjects : Migration
    {
        public override void Up()
        {
            Execute.Sql(
@"declare @batchStatement nvarchar(max)

select @batchStatement = coalesce(@batchStatement, '')
	+ 'print ''Compiling ' + Type + ' ' + Name + '...''
'
	+ 'exec sp_refreshsqlmodule ''' + Name + '''
'
from
(
	select
		'[' + TABLE_SCHEMA + '].[' + TABLE_NAME + ']' Name,
		'view' Type
	from INFORMATION_SCHEMA.VIEWS
	union
	select
		'[' + SPECIFIC_SCHEMA + '].[' + SPECIFIC_NAME + ']' Name,
		case ROUTINE_TYPE
			when 'PROCEDURE' then 'stored procedure'
			when 'FUNCTION' then 'function'
		end Type
	from INFORMATION_SCHEMA.ROUTINES
) name

exec sp_executesql @batchStatement");
        }

        public override void Down()
        {
            throw new NotSupportedException();
        }
    }
}