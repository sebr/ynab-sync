export declare interface ImportIdCreator {
  create(amount: number, date: string): string;
}

class ImportIds implements ImportIdCreator {
  private _ID_COUNTER = {};

  public create(amount: number, date: string): string {
    const idPrefix = "YNAB:" + amount + ":" + date;
    let idSuffix = this._ID_COUNTER[idPrefix] || 1;

    const importId = idPrefix + ":" + idSuffix;
    this._ID_COUNTER[idPrefix] = ++idSuffix;
    return importId;
  }
}

export default ImportIds;
