using Aspose.Cells;

namespace TMD.Model.Excel.AsposeCells
{
    public class AsposeCellsComment : IExcelComment
    {
        private Comment comment;

        public AsposeCellsComment(Comment comment)
        {
            this.comment = comment;
        }

        public int Row
        {
            get { return comment.Row; }
        }

        public int Column
        {
            get { return comment.Column; }
        }

        public string Author
        {
            get { return comment.Author; }
            set { comment.Author = value; }
        }

        public string Note
        {
            get { return comment.Note; }
            set { comment.Note = value; }
        }
    }
}
