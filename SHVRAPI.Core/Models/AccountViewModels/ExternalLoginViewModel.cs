﻿using System.ComponentModel.DataAnnotations;

namespace SHVRAPI.Core.Models.AccountViewModels
{
    public class ExternalLoginViewModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
