const {test, describe, expect, beforeEach} = require("@playwright/test");
const {loginWith, createNote} = require("./helper");

describe("Note app", () => {
  beforeEach(async ({page, request}) => {
    // initialization
    await request.post("/api/testing/reset");
    await request.post("/api/users", {
      data: {
        username: "taree",
        name: "Tari babe",
        password: "damenjo",
      },
    });

    await page.goto("/");
  });

  test("frontend page can be opened", async ({page}) => {
    const locator = page.getByText("Notes");
    await expect(locator).toBeVisible();
    await expect(
      page.getByText(
        "Note app, Department of Computer Science, University of Helsinki 2023"
      )
    ).toBeVisible();
  });

  test("user can login", async ({page}) => {
    loginWith(page, "taree", "damenjo");
    await expect(page.getByText("Hello Tari babe")).toBeVisible();
  });

  test("login fails with wrong password", async ({page}) => {
    loginWith(page, "taree", "damenji");
    await expect(page.getByText("wrong credentials")).toBeVisible();
  });

  describe("when logged in", () => {
    beforeEach(async ({page}) => {
      loginWith(page, "taree", "damenjo");
    });

    test("a new note can be created", async ({page}) => {
      await createNote(page, "a note created by playwright", true);
      await expect(
        page.getByText("a note created by playwright")
      ).toBeVisible();
    });

    describe("and a note exist", () => {
      beforeEach(async ({page}) => {
        await createNote(page, "another note created by playwrigt", true);
      });

      test("importance can be changed", async ({page}) => {
        await page.getByRole("button", {name: "make not important"}).click();
        await expect(page.getByText("make important")).toBeVisible();
      });

      test("note can be delete", async ({page}) => {
        await page.getByRole("button", {name: "delete"}).click();
        expect(page.getByText("another note created by playwright")).toBeHidden;
      });
    });
  });
});

// test.only if the only test executed or npm test -- -g "login fails with wrong password"
