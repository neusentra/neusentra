import { ApiProperty } from "@nestjs/swagger";
import { SuccessResponseDto } from "src/common/dto/success-response.dto";

export class CheckInitializationStatusResponse extends SuccessResponseDto {
    @ApiProperty({
        type: Object,
        description: 'Initialization status object',
        example: { initialized: true },
    })
    declare data: {
        initialized: boolean;
    };
}