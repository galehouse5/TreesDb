using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Security.Cryptography;
using TMD.Model.Validation;
using NHibernate.Validator.Engine;
using NHibernate.Validator.Constraints;

namespace TMD.Model.Users
{
    [Serializable]
    [ContextMethod("CheckPasswordMeetsGlobalRequirements", Tags = Tag.Screening)]
    public class Password
    {
        protected Password()
        { }

        public virtual byte[] Hash { get; private set; }
        public virtual int Numerics { get; private set; }
        public virtual int Uppercase { get; private set; }
        public virtual int Lowercase { get; private set; }
        public virtual int Specials { get; private set; }

        [Min(1, Message = "You must enter a password.", Tags = Tag.Screening)]
        public virtual int Length { get; private set; }

        [NotEquals(true, Message = "Your password can only contain the following special characters: ~`!@#$%^*()-_=+[{]}\\|;:,./?/*-+.", Tags = Tag.Screening)]
        public virtual bool HasInvalidCharacters { get; private set; }

        public virtual void CheckPasswordMeetsGlobalRequirements(IConstraintValidatorContext context)
        {
            if (Length > 0)
            {
                if (CharacterTypes < Registry.Settings.PasswordCharacterTypes)
                {
                    context.AddInvalid<Password, int>(string.Format(
                        "Your password must contain {0} of the following character types: numeric, lowercase, uppercase, or special", Registry.Settings.PasswordCharacterTypes),
                        p => p.CharacterTypes);
                }
                if (Length < Registry.Settings.PasswordLength)
                {
                    context.AddInvalid<Password, int>(string.Format(
                        "Your password must be {0} characters long.", Registry.Settings.PasswordLength),
                        p => p.Length);
                }
            }
        }

        public int CharacterTypes
        {
            get
            {
                int characterTypes = 0;
                if (Numerics > 0)
                {
                    characterTypes++;
                }
                if (Uppercase > 0)
                {
                    characterTypes++;
                }
                if (Lowercase > 0)
                {
                    characterTypes++;
                }
                if (Specials > 0)
                {
                    characterTypes++;
                }
                return characterTypes;
            }
        }

        public virtual bool VerifyPassword(string password, string salt)
        {
            byte[] hashedPassword = hashPassword(password.Trim(), salt.Trim());
            for (int i = 0; i < hashedPassword.Length; i++)
            {
                if (this.Hash[i] != hashedPassword[i])
                {
                    return false;
                }
            }
            return true;
        }

        private static HashAlgorithm s_HashAlgorithm = SHA256.Create();
        private static byte[] hashPassword(string password, string salt)
        {
            string saltedPassword = password + salt;
            byte[] bytes = Encoding.Unicode.GetBytes(saltedPassword);
            return s_HashAlgorithm.ComputeHash(bytes);
        }

        private static string s_Numerics = "1234567890";
        private static int countNumerics(string password)
        {
            int count = 0;
            foreach (char c in password)
            {
                if (s_Numerics.Contains(c))
                {
                    count++;
                }
            }
            return count;
        }

        private static string s_UppercaseAlphabetics = "QWERTYUIOPASDFGHJKLZXCVBNM";
        private static int countUppercaseAlphabetics(string password)
        {
            int count = 0;
            foreach (char c in password)
            {
                if (s_UppercaseAlphabetics.Contains(c))
                {
                    count++;
                }
            }
            return count;
        }

        private static string s_LowercaseAlphabetics = "qwertyuiopasdfghjklzxcvbnm";
        private static int countLowercaseAlphabetics(string password)
        {
            int count = 0;
            foreach (char c in password)
            {
                if (s_LowercaseAlphabetics.Contains(c))
                {
                    count++;
                }
            }
            return count;
        }

        private static string s_SpecialCharacters = "~`!@#$%^*()-_=+[{]}\\|;:,./?/*-+.";
        private static int countSpecialCharacters(string password)
        {
            int count = 0;
            foreach (char c in password)
            {
                if (s_SpecialCharacters.Contains(c))
                {
                    count++;
                }
            }
            return count;
        }

        private static bool hasInvalidCharacters(string password)
        {
            if (password.Length > (countNumerics(password) 
                + countUppercaseAlphabetics(password) 
                + countLowercaseAlphabetics(password)
                + countSpecialCharacters(password)))
            {
                return true;
            }
            return false;
        }

        public static Password Create(string password, string salt)
        {
            return new Password()
            {
                Hash = hashPassword(password, salt),
                Length = password.Length,
                Numerics = countNumerics(password),
                Uppercase = countUppercaseAlphabetics(password),
                Lowercase = countLowercaseAlphabetics(password),
                Specials = countSpecialCharacters(password),
                HasInvalidCharacters = hasInvalidCharacters(password)
            };
        }

        public static InvalidValue[] Validate(string password)
        {
            return Password.Create(password, string.Empty).Validate();
        }

        private static RandomNumberGenerator s_RNG = RNGCryptoServiceProvider.Create();
        private static string s_PossibleRandomPasswordCharacters = "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM~`!@#$%^*()-_=+[{]}\\|;:,./?/*-+.";
        public static string GenerateRandomPassword(int length)
        {
            byte[] randomBytes = new byte[length];
            s_RNG.GetBytes(randomBytes);
            char[] randomPasswordCharacters = new char[length];
            for (int i = 0; i < randomBytes.Length; i++)
            {
                randomPasswordCharacters[i] = s_PossibleRandomPasswordCharacters
                    [randomBytes[i] % s_PossibleRandomPasswordCharacters.Length];
            }
            return new string(randomPasswordCharacters);
        }
    }
}
