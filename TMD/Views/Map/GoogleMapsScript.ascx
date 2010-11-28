<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<String>" %>
<script type="text/javascript" src="http://www.google.com/jsapi?key=<%= Model %>"></script>
<script type="text/javascript">
    google.load('maps', '3', { other_params: 'sensor=false' });
</script>