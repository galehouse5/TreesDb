using System;
using System.Diagnostics;
using System.Web.Mvc;
using TMD.Extensions;
using TMD.Model.Extensions;

namespace TMD.Models.Import
{
    public enum ImportModelLevel { Unknown, Trip, Site, Tree }
    public enum ImportModelAction { Unknown, Add, SaveUnlessOptionalErrors, Edit, Remove, DetailedEdit, SaveIgnoringOptionalErrors }

    [DebuggerDisplay("{Action} {Level} with Id {Id}")]
    public class ImportInnerActionModel : IModelBinder
    {
        public int Id { get; private set; }
        public ImportModelAction Action { get; private set; }
        public ImportModelLevel Level { get; private set; }

        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            string expression = bindingContext.ValueProvider.GetValue(bindingContext.ModelName).AttemptedValue;
            string[] parts = expression.Split('.');
            return new ImportInnerActionModel
            {
                Level = parts[0].ParseEnum(ImportModelLevel.Unknown),
                Id = Convert.ToInt32(parts[1]),
                Action = parts[2].ParseEnum(ImportModelAction.Unknown)
            };
        }

        public bool Equals(ImportModelLevel level, ImportModelAction action)
        {
            return this.Level == level && this.Action == action;
        }
    }

    public static class ImportInnerActionModelExtensions
    {
        public static MvcHtmlString ImportInnerActionButton(this HtmlHelper html, string text, ImportModelLevel level, int id, ImportModelAction action,
            ButtonColor color = ButtonColor.Default, ButtonSize size = ButtonSize.Default)
        {
            return html.SubmitButton(text, "innerAction", string.Format("{0}.{1}.{2}", level, id, action), color, size);
        }
    }
}