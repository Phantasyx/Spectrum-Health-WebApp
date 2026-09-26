//-----------------------------------------------------------------------
// <copyright file="Hitbox.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Core.Models
{
    using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Entity framework model class
    /// </summary>
    public class Hitbox
    {
        /// <summary>
        /// Gets or sets this Hitbox's Id
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the Room Id this Hitbox belongs to
        /// </summary>
        [Required]
        public int RoomId { get; set; }

        /// <summary>
        /// Gets or sets top y coordinate
        /// </summary>
        public float Top { get; set; }

        /// <summary>
        /// Gets or sets bottom y coordinate
        /// </summary>
        public float Bottom { get; set; }

        /// <summary>
        /// Gets or sets left x coordinate
        /// </summary>
        public float Left { get; set; }

        /// <summary>
        /// Gets or sets right x coordinate
        /// </summary>
        public float Right { get; set; }

        /// <summary>
        /// Gets or sets the main title text
        /// </summary>
        [Display(Name = "Text")]
        [Required]
        [StringLength(255, MinimumLength = 1, ErrorMessage = "Must add Title of Item.")]
        public string Text { get; set; }

        /// <summary>
        /// Gets or sets the description text
        /// </summary>
        [Display(Name = "Sub")]
        [StringLength(1000, MinimumLength = 0, ErrorMessage = "Only 1000 Characters allowed.")]
        [DataType(DataType.MultilineText)]
        public string Sub { get; set; }
    }
}
