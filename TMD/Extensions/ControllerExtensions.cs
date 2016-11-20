using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Models.Import;
using TMD.Model;
using TMD.Model.Locations;
using TMD.Model.Extensions;

namespace TMD.Extensions
{
    public static class ControllerEtensions
    {
        private class ViewDataDecorator : ActionResult
        {
            public string Key { get; set; }
            public object Value { get; set; }
            public ActionResult Next { get; set; }

            public override void ExecuteResult(ControllerContext context)
            {
                context.Controller.ViewData[Key] = Value;
                Next.ExecuteResult(context);
            }
        }

        public static ActionResult AddViewData(this ActionResult result, string key, object value)
        {
            return new ViewDataDecorator { Next = result, Key = key, Value = value };
        }
    }
}