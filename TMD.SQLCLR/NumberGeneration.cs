using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.SqlServer.Server;
using System.Collections;
using System.Data.SqlTypes;

namespace TMD.SQLCLR
{
    public class NumberGeneration
    {
        [SqlFunction(FillRowMethodName = "FillSequentialNumberRow", TableDefinition = "Number INT", IsDeterministic = true, IsPrecise = true)]
        public static IEnumerable GenerateSequentialNumbers(int min, int max)
        {
            for (int i = min; i <= max; i++)
            {
                yield return i;
            }
        }

        public static void FillSequentialNumberRow(object sequentialNumber, out SqlInt32 number)
        {
            number = new SqlInt32((int)sequentialNumber);
        }
    }
}
