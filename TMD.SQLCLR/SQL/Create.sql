CREATE FUNCTION RankSentences(@firstSentence NVARCHAR(100), @secondSentence NVARCHAR(100), @expression NVARCHAR(100))
RETURNS float EXTERNAL NAME [TMD.SQLCLR].[TMD.SQLCLR.StringComparison].RankSentences
GO

CREATE FUNCTION RankWords(@firstWord NVARCHAR(100), @secondWord NVARCHAR(100), @expression NVARCHAR(100))
RETURNS float EXTERNAL NAME [TMD.SQLCLR].[TMD.SQLCLR.StringComparison].RankWords
GO

CREATE FUNCTION ParseExpression(@expression NVARCHAR(100))
RETURNS NVARCHAR(100) EXTERNAL NAME [TMD.SQLCLR].[TMD.SQLCLR.StringComparison].ParseExpression
GO
