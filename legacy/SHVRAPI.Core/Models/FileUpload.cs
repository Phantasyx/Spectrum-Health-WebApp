//-----------------------------------------------------------------------
// <copyright file="FileUpload.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Core.Models
{
    using System.ComponentModel.DataAnnotations;
    using Microsoft.AspNetCore.Http;

    /// <summary>
    /// Entity framework model class
    /// </summary>
    public class FileUpload
    {
        /// <summary>
        /// Gets or sets this Upload's title
        /// </summary>
        [Required]
        [Display(Name = "Title")]
        [StringLength(60, MinimumLength = 3)]
        public string Title { get; set; }

        /// <summary>
        /// Gets or sets this upload
        /// </summary>
        [Required]
        [Display(Name = "Upload")]
        public IFormFile Upload { get; set; }
    }
}
