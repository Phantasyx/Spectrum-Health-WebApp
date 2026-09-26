//-----------------------------------------------------------------------
// <copyright file="UploadService.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Services
{
    using Microsoft.AspNetCore.Http;
    using SHVRAPI.Data.Interfaces;
    using SHVRAPI.Services.Interfaces;

    /// <summary>
    /// Service class to interact with items in the room database
    /// </summary>
    public class UploadService : IUploadService
    {
        /// <summary>
        /// Repo used by service to interact with db directly
        /// </summary>
        private readonly IUploadRepository uploadRepository;

        /// <summary>
        /// Initializes a new instance of the <see cref="UploadService"/> class.
        /// </summary>
        /// <param name="uploadRepository">the upload repo</param>
        public UploadService(IUploadRepository uploadRepository)
        {
            this.uploadRepository = uploadRepository;
        }

        /// <summary>
        /// Create room
        /// </summary>
        /// <param name="files">upload to create</param>
        public void PostUpload(IFormFile files)
        {
            this.uploadRepository.PostUpload(files);
        }
    }
}
