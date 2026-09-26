namespace SHVRAPI
{
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using SHVRAPI.Areas.Admin.Controllers;
    using SHVRAPI.Areas.Public.Controllers;
    using SHVRAPI.Core.Models;
    using SHVRAPI.Data;
    using SHVRAPI.Data.Interfaces;
    using SHVRAPI.Services;
    using SHVRAPI.Services.Interfaces;

    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            this.Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddIdentity<ApplicationUser, IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            // Connection to database
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(this.Configuration.GetConnectionString("DefaultConnection")));

            // Dependency Injection
            services.AddTransient<IBuildingRepository, BuildingRepository>();
            services.AddTransient<IBuildingService, BuildingService>();
            services.AddTransient<BuildingController>();

            services.AddTransient<IRoomRepository, RoomRepository>();
            services.AddTransient<IRoomService, RoomService>();
            services.AddTransient<RoomController>();

            services.AddTransient<IHitboxRepository, HitboxRepository>();
            services.AddTransient<IHitboxService, HitboxService>();
            services.AddTransient<HitboxController>();

            services.AddTransient<IUploadRepository, UploadRepository>();
            services.AddTransient<IUploadService, UploadService>();
            services.AddTransient<UploadFilesController>();

            services.AddTransient<GetController>();
            services.AddTransient<VRController>();

            services.AddMemoryCache();
            services.AddSession();
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
                app.UseDatabaseErrorPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();

            app.UseAuthentication();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "areaRoute",
                    template: "{area:exists}/{controller=Home}/{action=Index}/{id?}");
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
                routes.MapRoute(
                    name: "DefaultApi",
                    template: "api/{controller}/{id}");
            });
        }
    }
}
