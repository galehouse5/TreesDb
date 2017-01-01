using NHibernate.Validator.Constraints;
using NHibernate.Validator.Engine;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using TMD.Model.Validation;

namespace TMD.Model.Users
{
    [ContextMethod(nameof(RequiredValidate), Tags = ValidationTag.Required)]
    public class Password
    {
        protected Password()
        { }

        public virtual byte[] Hash { get; private set; }
        public virtual int Numerics { get; private set; }
        public virtual int Uppercase { get; private set; }
        public virtual int Lowercase { get; private set; }
        public virtual int Specials { get; private set; }

        [Min(1, Message = "You must enter a password.", Tags = ValidationTag.Required)]
        public virtual int Length { get; private set; }

        [NotEquals(true, Message = "Your password must not contain invalid characters.", Tags = ValidationTag.Required)]
        public virtual bool HasInvalidCharacters { get; private set; }

        public virtual void RequiredValidate(IConstraintValidatorContext context)
        {
            if (Length == 0) return;

            if (CharacterTypes < Registry.Settings.PasswordCharacterTypes)
            {
                context.AddInvalid(string.Format(
                    "Your password must contain {0} character types.",
                    Registry.Settings.PasswordCharacterTypes == 4 ? "four"
                    : Registry.Settings.PasswordCharacterTypes == 3 ? "three"
                    : Registry.Settings.PasswordCharacterTypes == 2 ? "two" : "one"),
                    nameof(CharacterTypes));
            }

            if (Length < Registry.Settings.PasswordLength)
            {
                context.AddInvalid("Your password is too short.", nameof(Length));
            }
        }

        public int CharacterTypes
            => Math.Sign(Numerics)
            + Math.Sign(Uppercase)
            + Math.Sign(Lowercase)
            + Math.Sign(Specials);

        public virtual bool VerifyPassword(string password, string salt)
        {
            byte[] hash = ComputeHash(password.Trim(), salt.Trim());
            return hash.SequenceEqual(this.Hash);
        }

        private static HashAlgorithm hashAlgorithm = SHA256.Create();
        protected static byte[] ComputeHash(string password, string salt)
        {
            string saltedPassword = password + salt;
            byte[] bytes = Encoding.Unicode.GetBytes(saltedPassword);
            return hashAlgorithm.ComputeHash(bytes);
        }

        public static Password Create(string password, string salt)
        {
            int numerics = password.Count(char.IsNumber);
            int uppercase = password.Count(char.IsUpper);
            int lowercase = password.Count(char.IsLower);
            int specials = password.Count(char.IsPunctuation) + password.Count(char.IsSymbol);

            return new Password
            {
                Hash = ComputeHash(password, salt),
                Length = password.Length,
                Numerics = numerics,
                Uppercase = uppercase,
                Lowercase = lowercase,
                Specials = specials,
                HasInvalidCharacters = password.Length > (numerics + uppercase + lowercase + specials)
            };
        }
    }
}
