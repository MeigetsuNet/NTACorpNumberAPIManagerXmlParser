import { parseStringPromise } from 'xml2js';

export async function convert(xml: string) {
    return await parseStringPromise(xml)
        .then(result => {
            return {
                lastUpdateDate: result.corporations.lastUpdateDate[0],
                divideNumber: result.corporations.divideNumber[0],
                divideSize: result.corporations.divideSize[0],
                corporations:
                    result.corporations.count === 0 || !result.corporations.corporation
                        ? []
                        : result.corporations.corporation
                              .map((corp: { [name: string]: string[] }) => {
                                  const Ret = {};
                                  Object.keys(corp).forEach(key => {
                                      if (corp[key][0].length === 0) return;
                                      Ret[key] = corp[key][0];
                                  });
                                  return Ret;
                              })
                              .filter(corp => Object.keys(corp).length > 0),
            };
        })
        .then(converted => {
            const Record = {
                last_update_date: converted.lastUpdateDate,
                divide_number: converted.divideNumber,
                divide_size: converted.divideSize,
                corporations: converted.corporations.map((corp: { [name: string]: string }) => {
                    return {
                        sequence_number: corp.sequenceNumber,
                        corp_number: corp.corporateNumber,
                        process: corp.process,
                        correct: corp.correct,
                        update_date: corp.updateDate,
                        change_date: corp.changeDate,
                        name: corp.name,
                        name_image_id: corp.nameImageId,
                        name_ruby: corp.furigana,
                        kind: corp.kind,
                        address: {
                            text: {
                                prefecture: corp.prefectureName,
                                city: corp.cityName,
                                street_number: corp.streetNumber,
                            },
                            code: {
                                prefecture: corp.prefectureCode,
                                city: corp.cityCode,
                            },
                            post_code: corp.postCode,
                            image_id: corp.addressImageId,
                            outside: corp.addressOutside,
                            outside_image_id: corp.addressOutsideImageId,
                        },
                        close: {
                            date: corp.closeDate,
                            cause: corp.closeCause,
                        },
                        successor_corporate_number: corp.successorCorporateNumber,
                        change_cause: corp.changeCause,
                        assignment_date: corp.assignmentDate,
                        latest: corp.latest,
                        en: {
                            name: corp.enName,
                            prefecture: corp.enPrefectureName,
                            city: corp.enCityName,
                            address_outside: corp.enAddressOutside,
                        },
                        ignore: corp.hihyoji,
                    };
                }),
            };
            Record.corporations.sort((a, b) => a.sequence_number - b.sequence_number);
            Record.corporations.forEach(corp => {
                delete corp.sequence_number;
            });
            const UndefinedRemovedData = JSON.parse(JSON.stringify(Record));
            function removeEmptyObjects(obj) {
                if (typeof obj !== 'object' || obj === null) return obj;
                if (Array.isArray(obj)) {
                    return obj.map(removeEmptyObjects);
                }
                const newObj = {};
                Object.keys(obj).forEach(key => {
                    const value = removeEmptyObjects(obj[key]);
                    if (
                        typeof value === 'object' &&
                        value !== null &&
                        !Array.isArray(value) &&
                        Object.keys(value).length === 0
                    ) {
                        return;
                    }
                    newObj[key] = value;
                });
                return newObj;
            }

            const CleanedData = removeEmptyObjects(UndefinedRemovedData);
            return CleanedData;
        });
}
