export interface CPATopic {
    id: string;
    grade: number;
    name: string;
    standards: string[];
}

export const MOCK_CPA_TOPICS: CPATopic[] = [
    {
        id: 'g1-add-20',
        grade: 1,
        name: 'Phép cộng trong phạm vi 20',
        standards: [
            'Thực hiện được phép cộng không nhớ trong phạm vi 20',
            'Vận dụng phép cộng để giải quyết vấn đề thực tế đơn giản'
        ]
    },
    {
        id: 'g2-mul-2-5',
        grade: 2,
        name: 'Bảng nhân 2, 5',
        standards: [
            'Nhận biết ý nghĩa phép nhân qua hình ảnh trực quan',
            'Thuộc bảng nhân 2 và bảng nhân 5',
            'Vận dụng giải bài toán có lời văn bằng 1 phép tính nhân'
        ]
    },
    {
        id: 'g3-area',
        grade: 3,
        name: 'Diện tích hình chữ nhật',
        standards: [
            'Nhận biết khái niệm diện tích',
            'Biết cách tính diện tích hình chữ nhật khi biết chiều dài và chiều rộng',
            'Giải bài toán thực tế liên quan đến diện tích'
        ]
    }
];
