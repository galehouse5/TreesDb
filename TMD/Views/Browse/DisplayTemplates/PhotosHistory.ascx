<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<IList<DatedPhotosModel>>" %>
<% if (Model.Count < 1) { %>
    (no photos)
<% } else { %>
    <table class="support_table">
        <tbody>
            <% for (int datedPhotosIndex = 0; datedPhotosIndex < Model.Count; datedPhotosIndex++) { %>
                <tr>
                    <td>
                        <span class="ticket open"><%= Model[datedPhotosIndex].Date.ToString("MM/dd/yyyy")%></span>
                    </td>
                    <td class="full">
                        <ul class="gallery">
                            <% for (int photoIndex = 0; photoIndex < Model[datedPhotosIndex].Photos.Count; photoIndex++) { %>
                                <%= Html.DisplayFor(m => m[datedPhotosIndex].Photos[photoIndex], "IPhoto")%>
                            <% } %>
                        </ul>
                    </td>
                    <td class="who">
                        Taken by <%= Html.DisplayFor(m => m[datedPhotosIndex].Photographers, "NameSeries")%>
                    </td>
                </tr>
            <% } %>
        </tbody>
    </table>
<% } %>