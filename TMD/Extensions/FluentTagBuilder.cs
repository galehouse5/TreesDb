using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Text;

namespace TMD.Extensions
{
    /// <summary>
    /// Tag builder with fluent api.
    /// </summary>
    public class Tag
    {
        private TagBuilder m_TagBuilder;
        private StringBuilder m_InnerHtml;

        public Tag(string tagName)
        {
            m_TagBuilder = new TagBuilder(tagName);
            m_InnerHtml = new StringBuilder(m_TagBuilder.InnerHtml);
        }

        
        public string IdAttributeDotReplacement { get { return m_TagBuilder.IdAttributeDotReplacement; } set { m_TagBuilder.IdAttributeDotReplacement = value; } }
        public string TagName { get { return m_TagBuilder.TagName; } }

        public Tag Css(string value) { m_TagBuilder.AddCssClass(value); return this; }
        public static string CreateSanitizedId(string originalId) { return TagBuilder.CreateSanitizedId(originalId); }
        public static string CreateSanitizedId(string originalId, string invalidCharReplacement) { return TagBuilder.CreateSanitizedId(originalId, invalidCharReplacement); }
        public Tag GenerateId(string name) { m_TagBuilder.GenerateId(name); return this; }
        public Tag Attr(string key, string value) { m_TagBuilder.MergeAttribute(key, value); return this; }
        public Tag Attr(string key, string value, bool replaceExisting) { m_TagBuilder.MergeAttribute(key, value, replaceExisting); return this; }
        public Tag Attrs<TKey, TValue>(IDictionary<TKey, TValue> attributes) { m_TagBuilder.MergeAttributes(attributes); return this; }
        public Tag Attrs<TKey, TValue>(IDictionary<TKey, TValue> attributes, bool replaceExisting) { m_TagBuilder.MergeAttributes(attributes, replaceExisting); return this; }
        public IDictionary<string, string> GetAttrs() { return m_TagBuilder.Attributes; }
        public string GetInnerHtml() { return m_InnerHtml.ToString(); }

        public override string ToString() 
        {
            m_TagBuilder.InnerHtml = m_InnerHtml.ToString();
            return m_TagBuilder.ToString(); 
        }

        public string ToString(TagRenderMode renderMode)
        {
            m_TagBuilder.InnerHtml = m_InnerHtml.ToString();
            return m_TagBuilder.ToString(renderMode); 
        }

        public MvcHtmlString ToMvcHtmlString()
        {
            return MvcHtmlString.Create(ToString());
        }

        public MvcHtmlString ToMvcHtmlString(TagRenderMode renderMode)
        {
            return MvcHtmlString.Create(ToString(renderMode));
        }

        public Tag InnerHtml(string innerHtml)
        {
            m_InnerHtml.Append(innerHtml);
            return this;
        }

        public Tag InnerText(string innerText)
        {
            m_InnerHtml.Append(HttpUtility.HtmlEncode(innerText));
            return this;
        }

        public Tag InnerText(string format, params object[] args)
        {
            m_InnerHtml.AppendFormat(format, args);
            return this;
        }

        public Tag InnerHtml(Tag builder)
        {
            m_InnerHtml.Append(builder.ToString());
            return this;
        }

        public Tag InnerHtml(Tag builder, TagRenderMode renderMode)
        {
            m_InnerHtml.Append(builder.ToString(renderMode));
            return this;
        }
        
        public Tag InnerHtml(TagBuilder builder)
        {
            m_InnerHtml.Append(builder.ToString());
            return this;
        }

        public Tag InnerHtml(TagBuilder builder, TagRenderMode renderMode)
        {
            m_InnerHtml.Append(builder.ToString(renderMode));
            return this;
        }

        public Tag InnerHtml(MvcHtmlString htmlString)
        {
            if (!MvcHtmlString.IsNullOrEmpty(htmlString)) {
                m_InnerHtml.Append(htmlString.ToString());
            }
            return this;
        }

        public Tag If(bool condition, Action<Tag> then)
        {
            if (condition) { then(this); }
            return this;
        }

        public Tag IfElse(bool condition, Action<Tag> then, Action<Tag> @else)
        {
            if (condition) { then(this); }
            else { @else(this);  }
            return this;
        }

        public static Tag Img() { return new Tag("img"); }
        public static Tag Div() { return new Tag("div"); }
        public static Tag Span() { return new Tag("span"); }
        public static Tag A() { return new Tag("a"); }
        public static Tag LI() { return new Tag("li"); }
        public static Tag UL() { return new Tag("ul"); }
        public static Tag Button() { return new Tag("button"); }
        public static Tag TR() { return new Tag("tr"); }
        public static Tag TD() { return new Tag("td"); }
        public static Tag P() { return new Tag("p"); }
        public static Tag Label() { return new Tag("label"); }
        public static Tag EM() { return new Tag("em"); }
        public static Tag Strong() { return new Tag("strong"); }
    }
}