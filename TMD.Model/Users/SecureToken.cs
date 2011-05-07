using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Security.Cryptography;

namespace TMD.Model.Users
{
    public class SecureToken
    {
        protected SecureToken()
        { }

        public virtual byte[] Value { get; private set; }

        public virtual string UrlEncodedValue
        {
            get
            {
                string base64Token = Convert.ToBase64String(Value);
                string urlEncodedToken = base64Token.Substring(0, base64Token.Length - 1).Replace('/', '_').Replace('+', '-');
                return urlEncodedToken;
            }
        }

        public static byte[] Decode(string urlEncodedToken)
        {
            string base64Token = urlEncodedToken.Replace('_', '/').Replace('-', '+') + "=";
            byte[] token;
            try
            {
                token = Convert.FromBase64String(base64Token);
            }
            catch (FormatException)
            {
                token = new byte[32];
            }
            return token;
        }

        private static RandomNumberGenerator s_RNG = RNGCryptoServiceProvider.Create();
        public static SecureToken Create()
        {
            byte[] token = new byte[32];
            s_RNG.GetBytes(token);
            return new SecureToken() { Value = token };
        }
    }
}
