declare @statementBatch nvarchar(max)

select @statementBatch = coalesce(@statementBatch, '')
    + 'DROP ' + Type + ' ' + Name + '
'
from
(
     select '[' + [schema].name + '].[' + [object].name + ']' Name,
        case [object].type
            when 'V' then 'VIEW'
            when 'P' then 'PROCEDURE'
            when 'FN' then 'FUNCTION'
            when 'IF' then 'FUNCTION'
            when 'TF' then 'FUNCTION'
            when 'TR' then 'TRIGGER'
        end Type
    from sys.objects [object]
    join sys.schemas [schema]
        on [schema].schema_id = [object].schema_id
    where [object].is_ms_shipped = 0
        and type in ('V', 'P', 'FN', 'IF', 'TF', 'TR')

    union all

    select '[' + [schema].Name + '].[' + [type].name + ']' Name,
        'TYPE' Type
    from sys.types [type]
    join sys.schemas [schema]
        on [schema].schema_id = [type].schema_id
    where [type].is_user_defined = 1
) asset

exec sp_executesql @statementBatch