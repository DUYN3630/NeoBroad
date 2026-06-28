using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NeoBoard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddToolsetExtraFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "toolsets",
                type: "longtext",
                nullable: false,
                defaultValue: "Available")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "location",
                table: "toolsets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "custodian",
                table: "toolsets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "supplier",
                table: "toolsets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "purchasedate",
                table: "toolsets",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "warrantymonths",
                table: "toolsets",
                type: "int",
                nullable: false,
                defaultValue: 12);

            migrationBuilder.AddColumn<string>(
                name: "itemsdetail",
                table: "toolsets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "lastmaintenancedate",
                table: "toolsets",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "department",
                table: "toolsets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "status", table: "toolsets");
            migrationBuilder.DropColumn(name: "location", table: "toolsets");
            migrationBuilder.DropColumn(name: "custodian", table: "toolsets");
            migrationBuilder.DropColumn(name: "supplier", table: "toolsets");
            migrationBuilder.DropColumn(name: "purchasedate", table: "toolsets");
            migrationBuilder.DropColumn(name: "warrantymonths", table: "toolsets");
            migrationBuilder.DropColumn(name: "itemsdetail", table: "toolsets");
            migrationBuilder.DropColumn(name: "lastmaintenancedate", table: "toolsets");
            migrationBuilder.DropColumn(name: "department", table: "toolsets");
        }
    }
}
