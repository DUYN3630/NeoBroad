using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NeoBoard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMaintenanceTicketingSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "assetcode",
                table: "assets",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<Guid>(
                name: "assignedtechnicianid",
                table: "assets",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<string>(
                name: "custodian",
                table: "assets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "invoicenumber",
                table: "assets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "location",
                table: "assets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "maintenanceintervalmonths",
                table: "assets",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "manufacturer",
                table: "assets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "model",
                table: "assets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "notes",
                table: "assets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "purchasedate",
                table: "assets",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "supplier",
                table: "assets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "technicalspecs",
                table: "assets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "warrantyexpiration",
                table: "assets",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "warrantymonths",
                table: "assets",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "maintenancetickets",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    assetid = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    assignedtechnicianid = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    description = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    scheduleddate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    maintenancedate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    totalcost = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    verificationresult = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    actiontaken = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    sparepartsused = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    notes = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    evidencephotourl = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    createdat = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_maintenancetickets", x => x.id);
                    table.ForeignKey(
                        name: "fk_maintenancetickets_assets_assetid",
                        column: x => x.assetid,
                        principalTable: "assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_maintenancetickets_users_assignedtechnicianid",
                        column: x => x.assignedtechnicianid,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "ix_assets_assignedtechnicianid",
                table: "assets",
                column: "assignedtechnicianid");

            migrationBuilder.CreateIndex(
                name: "ix_maintenancetickets_assetid",
                table: "maintenancetickets",
                column: "assetid");

            migrationBuilder.CreateIndex(
                name: "ix_maintenancetickets_assignedtechnicianid",
                table: "maintenancetickets",
                column: "assignedtechnicianid");

            migrationBuilder.AddForeignKey(
                name: "fk_assets_users_assignedtechnicianid",
                table: "assets",
                column: "assignedtechnicianid",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_assets_users_assignedtechnicianid",
                table: "assets");

            migrationBuilder.DropTable(
                name: "maintenancetickets");

            migrationBuilder.DropIndex(
                name: "ix_assets_assignedtechnicianid",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "assetcode",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "assignedtechnicianid",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "custodian",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "invoicenumber",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "location",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "maintenanceintervalmonths",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "manufacturer",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "model",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "notes",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "purchasedate",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "supplier",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "technicalspecs",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "warrantyexpiration",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "warrantymonths",
                table: "assets");
        }
    }
}
