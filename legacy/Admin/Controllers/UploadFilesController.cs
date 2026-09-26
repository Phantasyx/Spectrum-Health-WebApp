//-----------------------------------------------------------------------
// <copyright file="UploadFilesController.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Areas.Admin.Controllers
{
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using SHVRAPI.Services.Interfaces;

    /// <summary>
    /// Upload files controller
    /// </summary>
    public class UploadFilesController : Controller
    {
        /// <summary>
        /// Service for interacting with upload
        /// </summary>
        private readonly IUploadService uploadService;

        /// <summary>
        /// Initializes a new instance of the <see cref="UploadFilesController"/> class.
        /// </summary>
        /// <param name="uploadService">upload service</param>
        public UploadFilesController(IUploadService uploadService)
        {
            this.uploadService = uploadService;
        }

        [HttpPost]
        public IActionResult PostUpload(IFormFile files)
        {
            this.uploadService.PostUpload(files);

            // process uploaded files
            // Don't rely on or trust the FileName property without validation.
            return this.Ok();
        }
    }
}
