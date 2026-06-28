using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NeoBoard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentAndAssetHealthFresh : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "evidencephotourl",
                table: "borrowrequests",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "previoushash",
                table: "borrowrequests",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<Guid>(
                name: "studentid",
                table: "borrowrequests",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<string>(
                name: "transactionhash",
                table: "borrowrequests",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "assethealths",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    assetid = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    batterycyclecount = table.Column<int>(type: "int", nullable: true),
                    batteryhealthpercentage = table.Column<int>(type: "int", nullable: true),
                    bulbhoursused = table.Column<int>(type: "int", nullable: true),
                    maintenancecycledays = table.Column<int>(type: "int", nullable: false),
                    lastmaintenancedate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    nextscheduledmaintenance = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    estimatedreplacementdate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    healthstatus = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    healthnotes = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assethealths", x => x.id);
                    table.ForeignKey(
                        name: "fk_assethealths_assets_assetid",
                        column: x => x.assetid,
                        principalTable: "assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "students",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    studentcode = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    fullname = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    classname = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    email = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    department = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    isblocked = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    createdat = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_students", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "ix_borrowrequests_studentid",
                table: "borrowrequests",
                column: "studentid");

            migrationBuilder.CreateIndex(
                name: "ix_assethealths_assetid",
                table: "assethealths",
                column: "assetid",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "fk_borrowrequests_students_studentid",
                table: "borrowrequests",
                column: "studentid",
                principalTable: "students",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_borrowrequests_students_studentid",
                table: "borrowrequests");

            migrationBuilder.DropTable(
                name: "assethealths");

            migrationBuilder.DropTable(
                name: "students");

            migrationBuilder.DropIndex(
                name: "ix_borrowrequests_studentid",
                table: "borrowrequests");

            migrationBuilder.DropColumn(
                name: "evidencephotourl",
                table: "borrowrequests");

            migrationBuilder.DropColumn(
                name: "previoushash",
                table: "borrowrequests");

            migrationBuilder.DropColumn(
                name: "studentid",
                table: "borrowrequests");

            migrationBuilder.DropColumn(
                name: "transactionhash",
                table: "borrowrequests");
        }
    }
}
