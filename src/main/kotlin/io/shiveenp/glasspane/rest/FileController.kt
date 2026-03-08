package io.shiveenp.glasspane.rest

import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("api/v1/file")
class FileController {
    fun getFiles(): List<String> {
        return listOf("file1.txt", "file2.txt", "file3.txt")
    }
}
