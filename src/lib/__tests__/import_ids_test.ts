import ImportIds from "../ImportIds";

describe("Import Ids Test", () => {
  test("uses suffix of 1 by default", () => {
    expect(new ImportIds().create(123, "2018-01-02")).toBe("YNAB:123:2018-01-02:1");
  });

  test("correctly increments suffix", () => {
    const importIds = new ImportIds();
    expect(importIds.create(123, "2018-01-02")).toBe("YNAB:123:2018-01-02:1");
    expect(importIds.create(123, "2018-01-02")).toBe("YNAB:123:2018-01-02:2");
    expect(importIds.create(123, "2018-01-02")).toBe("YNAB:123:2018-01-02:3");
    expect(importIds.create(123, "2018-01-02")).toBe("YNAB:123:2018-01-02:4");
    expect(importIds.create(123, "2018-01-02")).toBe("YNAB:123:2018-01-02:5");
  });

  test("unique amounts / same date have same suffix", () => {
    const importIds = new ImportIds();
    expect(importIds.create(123, "2018-01-02")).toBe("YNAB:123:2018-01-02:1");
    expect(importIds.create(456, "2018-01-02")).toBe("YNAB:456:2018-01-02:1");
  });

  test("same amounts / unique dates have same suffix", () => {
    const importIds = new ImportIds();
    expect(importIds.create(123, "2018-01-02")).toBe("YNAB:123:2018-01-02:1");
    expect(importIds.create(123, "2018-01-03")).toBe("YNAB:123:2018-01-03:1");
  });

  test("different instances do not leak counter", () => {
    const importIdsA = new ImportIds();
    const importIdsB = new ImportIds();
    expect(importIdsA.create(123, "2018-01-02")).toBe("YNAB:123:2018-01-02:1");
    expect(importIdsB.create(123, "2018-01-02")).toBe("YNAB:123:2018-01-02:1");
  });
});
