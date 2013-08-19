using Elmah;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Services.Client;
using System.Linq;
using System.Net;

namespace Tmd.WindowsAzure
{
    public class TableStorageErrorLog : ErrorLog
    {
        private static string sanitizePartitionKey(string key)
        {
            return key.Replace("/", string.Empty)
                .Replace("\\", string.Empty)
                .Replace("#", string.Empty)
                .Replace("?", string.Empty);
        }

        private class ErrorEntityTotalCount : TableEntity
        {
            public ErrorEntityTotalCount()
            { }

            public ErrorEntityTotalCount(string applicationName)
                : base(sanitizePartitionKey(applicationName), "TotalCount")
            {
                Timestamp = DateTime.UtcNow;
            }

            public int TotalCount { get; set; }
        }

        private class ErrorEntity : TableEntity
        {
            private static string generateRowKey(DateTime utcTime)
            {
                // ensure entities are ordered by time descending
                return (DateTime.MaxValue.Ticks - utcTime.Ticks).ToString("d19");
            }

            public ErrorEntity()
            { }

            public ErrorEntity(string applicationName, Error error)
                : base(sanitizePartitionKey(applicationName), generateRowKey(error.Time.ToUniversalTime()))
            {
                Timestamp = error.Time.ToUniversalTime();
                ApplicationName = error.ApplicationName;
                HostName = error.HostName;
                Type = error.Type;
                Source = error.Source;
                Message = error.Message;
                User = error.User;
                StatusCode = error.StatusCode;
                TimeUtc = error.Time.ToUniversalTime();
                AllXml = ErrorXml.EncodeString(error);
            }

            public string ApplicationName { get; set; }
            public string HostName { get; set; }
            public string Type { get; set; }
            public string Source { get; set; }
            public string Message { get; set; }
            public string User { get; set; }
            public int StatusCode { get; set; }
            public DateTime TimeUtc { get; set; }
            public string AllXml { get; set; }

            public Error ToError()
            {
                return ErrorXml.DecodeString(AllXml);
            }
        }

        public TableStorageErrorLog(IDictionary config)
        {
            if (config.Contains("connectionStringName"))
            {
                ConnectionString = ConfigurationManager.ConnectionStrings[(string)config["connectionStringName"]].ConnectionString;
            }
            else if (config.Contains("connectionString"))
            {
                ConnectionString = (string)config["connectionString"];
            }
            else
            {
                throw new ArgumentException("Expected connectionStringName or connectionString configuration attribute");
            }
            ApplicationName = (config["applicationName"] ?? string.Empty).ToString();
            EntitySetName = (config["entitySetName"] ?? "ElmahErrors").ToString();
        }

        public TableStorageErrorLog(string connectionString, string applicationName = null, string entitySetName = null)
        {
            this.ConnectionString = connectionString;
            this.EntitySetName = entitySetName ?? "ElmahErrors";
            this.ApplicationName = applicationName ?? string.Empty;
        }

        public override string Name { get { return "Microsoft Windows Azure Table Storage Error Log"; } }
        public string ConnectionString { get; private set; }
        public string EntitySetName { get; private set; }

        private bool tableExists = false;
        private CloudTable getTable()
        {
            CloudTableClient client = CloudStorageAccount.Parse(ConnectionString).CreateCloudTableClient();
            CloudTable table = client.GetTableReference(EntitySetName);

            if (!tableExists)
            {
                table.CreateIfNotExists();
                tableExists = true;
            }

            return table;
        }

        public override string Log(Error error)
        {
            while (true)
            {
                try
                {
                    CloudTable table = getTable();
                    TableBatchOperation operation = new TableBatchOperation();

                    ErrorEntity errorEntity = new ErrorEntity(ApplicationName, error);
                    operation.Insert(errorEntity);

                    ErrorEntityTotalCount totalCount = (ErrorEntityTotalCount)(table.Execute(
                        TableOperation.Retrieve<ErrorEntityTotalCount>(ApplicationName, "TotalCount")
                        ).Result)
                        ?? new ErrorEntityTotalCount(ApplicationName) { TotalCount = 0 };
                    totalCount.TotalCount = totalCount.TotalCount + 1;
                    operation.InsertOrReplace(totalCount);

                    table.ExecuteBatch(operation);
                    return errorEntity.RowKey;
                }
                catch (DataServiceRequestException ex)
                {
                    // can occur when total count is updated concurrently
                    if (HttpStatusCode.PreconditionFailed == (HttpStatusCode)ex.Response.First().StatusCode) continue;
                    // can occur when total count is added concurrently
                    if (HttpStatusCode.Conflict == (HttpStatusCode)ex.Response.First().StatusCode) continue;
                    throw;
                }
            }
        }

        public override int GetErrors(int pageIndex, int pageSize, IList errorEntryList)
        {
            CloudTable table = getTable();

            IEnumerable<ErrorEntity> errorEntities = table.ExecuteQuery(new TableQuery<ErrorEntity>()
                .Where(TableQuery.CombineFilters(
                    TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, ApplicationName),
                    TableOperators.And,
                    TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.NotEqual, "TotalCount")))
                .Take((pageIndex + 1) * pageSize))
                .Skip(pageIndex * pageSize);

            foreach (ErrorEntity errorEntity in errorEntities)
            {
                errorEntryList.Add(new ErrorLogEntry(this, errorEntity.RowKey, errorEntity.ToError()));
            }

            ErrorEntityTotalCount totalCount = (ErrorEntityTotalCount)(table.Execute(
                TableOperation.Retrieve<ErrorEntityTotalCount>(ApplicationName, "TotalCount")).Result);

            return null == totalCount ? 0 : totalCount.TotalCount;
        }

        public override ErrorLogEntry GetError(string id)
        {
            CloudTable table = getTable();

            ErrorEntity errorEntity = (ErrorEntity)(table.Execute(
                TableOperation.Retrieve<ErrorEntity>(ApplicationName, id)).Result);

            return null == errorEntity ? null : new ErrorLogEntry(this, errorEntity.RowKey, errorEntity.ToError());
        }
    }
}