//-----------------------------------------------------------------------
// <copyright file="UploadRepository.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Data
{
    using System.IO;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Http;
    using SHVRAPI.Data.Interfaces;

    /// <summary>
    /// Repo class that service classes use to interact with db
    /// </summary>
    public class UploadRepository : IUploadRepository
    {
        /// <summary>
        /// Db context
        /// </summary>
        private readonly ApplicationDbContext context;

        /// <summary>
        /// Used to get the wwwroot folder
        /// </summary>
        private readonly IHostingEnvironment appEnvironment;

        /// <summary>
        /// Initializes a new instance of the <see cref="UploadRepository"/> class.
        /// </summary>
        /// <param name="con">the db context</param>
        public UploadRepository(ApplicationDbContext con, IHostingEnvironment app)
        {
            this.context = con;
            this.appEnvironment = app;
        }

        /// <summary>
        /// Upload the image to the UploadFiles folder
        /// </summary>
        /// <param name="files">the image file</param>
        public async void PostUpload(IFormFile files)
        {
            string imageFolder = "\\UploadFiles";

            // full path to file in temp location
            string pathWebRoot = this.appEnvironment.WebRootPath;

            string filePath = pathWebRoot + imageFolder + "\\" + files.FileName;

            string file_Target_Original = filePath;

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await files.CopyToAsync(stream);
            }
        }
    }
}
